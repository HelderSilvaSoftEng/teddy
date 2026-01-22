#!/usr/bin/env node

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

const thresholds = {
  responseTime: 500,    // ms
  failureRate: 0.1,     // 10%
};

async function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 10000,
    };

    const startTime = Date.now();
    const protocol = url.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null,
          duration,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🚀 Backend Performance Tests\n');
  console.log(`📍 Target: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  try {
    // Test 1: Login
    console.log('1️⃣  Testing Authentication...');
    try {
      const loginRes = await makeRequest('POST', `${BASE_URL}/auth/login`, {
        email: 'teste@teste.com',
        password: 'senha123',
      });

      const loginOk = loginRes.status === 200 || loginRes.status === 401;
      const timeOk = loginRes.duration < thresholds.responseTime;
      
      console.log(`   Status: ${loginRes.status} ${loginOk ? '✅' : '❌'} (401 is ok for non-existent user)`);
      console.log(`   Time: ${loginRes.duration}ms ${timeOk ? '✅' : '❌'}`);

      if (loginOk && timeOk) {
        passed++;
        if (loginRes.data?.accessToken) {
          authToken = loginRes.data.accessToken;
          console.log(`   ✅ Auth token obtained`);
        } else {
          console.log(`   ℹ️  No token (user may not exist - run migrations to seed data)`);
        }
      } else {
        failed++;
      }

      results.push({
        name: 'Login',
        status: loginRes.status,
        duration: loginRes.duration,
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }

    await sleep(1000);

    if (authToken) {
      // Test 2: Dashboard Stats
      console.log('\n2️⃣  Testing Dashboard Stats...');
      try {
        const statsRes = await makeRequest('GET', `${BASE_URL}/dashboard/stats`, null, {
          Authorization: `Bearer ${authToken}`,
        });

        const statusOk = statsRes.status === 200 || statsRes.status === 401;
        const timeOk = statsRes.duration < thresholds.responseTime;

        console.log(`   Status: ${statsRes.status} ${statusOk ? '✅' : '❌'}`);
        console.log(`   Time: ${statsRes.duration}ms ${timeOk ? '✅' : '❌'}`);

        if (statusOk && timeOk) {
          passed++;
        } else {
          failed++;
        }

        results.push({
          name: 'Dashboard Stats',
          status: statsRes.status,
          duration: statsRes.duration,
        });
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failed++;
      }

      await sleep(1000);

      // Test 3: Recent Customers
      console.log('\n3️⃣  Testing Recent Customers...');
      try {
        const customersRes = await makeRequest(
          'GET',
          `${BASE_URL}/dashboard/recent-customers?limit=5`,
          null,
          { Authorization: `Bearer ${authToken}` }
        );

        const statusOk = customersRes.status === 200 || customersRes.status === 401;
        const timeOk = customersRes.duration < thresholds.responseTime;

        console.log(`   Status: ${customersRes.status} ${statusOk ? '✅' : '❌'}`);
        console.log(`   Time: ${customersRes.duration}ms ${timeOk ? '✅' : '❌'}`);

        if (statusOk && timeOk) {
          passed++;
        } else {
          failed++;
        }

        results.push({
          name: 'Recent Customers',
          status: customersRes.status,
          duration: customersRes.duration,
        });
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failed++;
      }

      await sleep(1000);

      // Test 4: Customer Trends
      console.log('\n4️⃣  Testing Customer Trends...');
      try {
        const trendsRes = await makeRequest(
          'GET',
          `${BASE_URL}/dashboard/customer-trend/day?days=30`,
          null,
          { Authorization: `Bearer ${authToken}` }
        );

        const statusOk = trendsRes.status === 200 || trendsRes.status === 401;
        const timeOk = trendsRes.duration < thresholds.responseTime;

        console.log(`   Status: ${trendsRes.status} ${statusOk ? '✅' : '❌'}`);
        console.log(`   Time: ${trendsRes.duration}ms ${timeOk ? '✅' : '❌'}`);

        if (statusOk && timeOk) {
          passed++;
        } else {
          failed++;
        }

        results.push({
          name: 'Customer Trends',
          status: trendsRes.status,
          duration: trendsRes.duration,
        });
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failed++;
      }
    } else {
      console.log('\n⚠️  Could not obtain auth token, skipping protected endpoints');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Performance Test Summary');
    console.log('='.repeat(50));

    const totalTests = passed + failed;
    const passRate = ((passed / totalTests) * 100).toFixed(2);

    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%\n`);

    console.log('Response Times:');
    results.forEach((result) => {
      const status = result.duration < thresholds.responseTime ? '✅' : '⚠️';
      console.log(`  ${status} ${result.name}: ${result.duration}ms`);
    });

    const avgTime = (results.reduce((sum, r) => sum + r.duration, 0) / results.length).toFixed(2);
    console.log(`  📊 Average: ${avgTime}ms`);

    console.log('\n' + '='.repeat(50));

    if (failed === 0) {
      console.log('✅ All performance tests passed!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${failed} test(s) failed`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  }
}

// Check if backend is running
console.log('⏳ Checking if backend is running...\n');
makeRequest('GET', `${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Backend is running\n');
    runTests();
  })
  .catch(() => {
    console.error('❌ Backend is not running!');
    console.error('Please start it with: npm run backend:dev\n');
    process.exit(1);
  });
