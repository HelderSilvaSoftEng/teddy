/**
 * Template HTML para email de recuperação de senha
 */
export function passwordRecoveryTemplate(userName: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha - Teddy</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        
        .message {
          font-size: 14px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        
        .warning-box {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 30px 0;
          border-radius: 4px;
          font-size: 13px;
          color: #856404;
        }
        
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 40px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .link-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid #eee;
        }
        
        .link-text {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
        }
        
        .reset-link {
          word-break: break-all;
          font-size: 12px;
          color: #667eea;
          text-decoration: none;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          display: block;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
        
        .footer p {
          margin: 8px 0;
        }
        
        .footer-links a {
          color: #667eea;
          text-decoration: none;
          margin: 0 10px;
        }
        
        @media (max-width: 600px) {
          .content {
            padding: 20px;
          }
          
          .header {
            padding: 30px 15px;
          }
          
          .header h1 {
            font-size: 22px;
          }
          
          .reset-button {
            padding: 12px 30px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>🔐 Recuperação de Senha</h1>
          <p>Teddy - Sistema de Gerenciamento de Clientes</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p class="greeting">Olá ${userName},</p>
          
          <p class="message">
            Recebemos uma solicitação para recuperar sua senha. Se você não fez esta solicitação, 
            ignore este email. Caso contrário, clique no botão abaixo para criar uma nova senha.
          </p>
          
          <div class="button-container">
            <a href="${resetLink}" class="reset-button">Resetar Senha</a>
          </div>
          
          <div class="warning-box">
            ⏰ <strong>Este link expira em 30 minutos.</strong> Se você não completar a recuperação 
            de senha neste período, solicite um novo link.
          </div>
          
          <div class="link-section">
            <p class="link-text">Ou copie e cole este link no seu navegador:</p>
            <a href="${resetLink}" class="reset-link">${resetLink}</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Você recebeu este email porque sua conta foi usada para solicitar uma recuperação de senha.</p>
          <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            © 2026 Teddy. Todos os direitos reservados.
          </p>
          <p style="margin-top: 10px;">
            <a href="https://teddy.com/privacy">Privacidade</a> | 
            <a href="https://teddy.com/security">Segurança</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
