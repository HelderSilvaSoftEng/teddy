#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const urls = [
  'http://localhost:5173',
  'http://localhost:5173/login',
  'http://localhost:5173/dashboard',
];

const opts = {
  logLevel: 'info',
  output: 'json',
  disableDeviceEmulation: true,
  throttling: {
    rttMs: 40,
    downstreamThroughputKbps: 10 * 1024,
    upstreamThroughputKbps: 3 * 1024,
    cpuSlowdownMultiplier: 1,
  },
};

const thresholds = {
  performance: 70,
  accessibility: 80,
  'best-practices': 80,
  seo: 80,
};

async function runLighthouse(url, chrome) {
  try {
    const options = {
      ...opts,
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);

    const scores = {
      url,
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      'best-practices': runnerResult.lhr.categories['best-practices'].score * 100,
      seo: runnerResult.lhr.categories.seo.score * 100,
    };

    return { scores, report: runnerResult.report };
  } catch (error) {
    console.error(`Error running Lighthouse for ${url}:`, error);
    return null;
  }
}

async function launchChrome() {
  return await chromeLauncher.launch({ chromeFlags: ['--headless'] });
}

async function main() {
  let chrome = null;
  const results = [];
  let hasFailures = false;

  try {
    chrome = await launchChrome();

    console.log('🚀 Running Lighthouse Performance Tests...\n');

    for (const url of urls) {
      console.log(`📊 Testing: ${url}`);
      const result = await runLighthouse(url, chrome);

      if (result) {
        results.push(result.scores);

        // Check thresholds
        for (const [metric, threshold] of Object.entries(thresholds)) {
          const score = result.scores[metric];
          const status = score >= threshold ? '✅' : '❌';
          console.log(`  ${status} ${metric}: ${score.toFixed(2)} (threshold: ${threshold})`);

          if (score < threshold) {
            hasFailures = true;
          }
        }

        // Save report
        const reportDir = path.join(__dirname, '../coverage/lighthouse');
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportName = url.replace(/[/:]/g, '-').replace(/^-+/, '');
        const reportPath = path.join(reportDir, `${reportName}.html`);
        fs.writeFileSync(reportPath, result.report);
        console.log(`  📄 Report: ${reportPath}\n`);
      }
    }

    // Save summary
    const summaryPath = path.join(__dirname, '../coverage/lighthouse/summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

    console.log('\n📋 Summary saved to:', summaryPath);

    if (hasFailures) {
      console.log('\n❌ Some performance metrics failed thresholds!');
      process.exit(1);
    } else {
      console.log('\n✅ All performance metrics passed!');
    }
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

main();
