const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const FROM_EMAIL = 'CAFM <noreply@cafm.com>';

class EmailService {
  /**
   * Email générique
   */
  async send({ to, subject, html, text, attachments }) {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Mock Email sent to:', to, 'Subject:', subject);
      return { id: 'mock-id' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        attachments
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Email error:', err);
      throw err;
    }
  }

  async sendWelcome(email, firstName) {
    return this.send({
      to: email,
      subject: '🎉 Bienvenue sur CAFM CRM',
      html: `
        <h1>Bonjour ${firstName},</h1>
        <p>Votre compte CAFM CRM est actif. Profitez de 14 jours d'essai gratuit.</p>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/crm/login">Se connecter</a>
      `
    });
  }

  async sendReport(email, reportData, pdfBuffer) {
    return this.send({
      to: email,
      subject: `📊 Rapport ${reportData.type} - ${new Date().toLocaleDateString('fr-FR')}`,
      html: `<p>Bonjour,</p><p>Veuillez trouver votre rapport en pièce jointe.</p>`,
      attachments: [{
        filename: `rapport-${Date.now()}.pdf`,
        content: pdfBuffer
      }]
    });
  }

  async sendAlert(email, alert) {
    return this.send({
      to: email,
      subject: `🚨 ${alert.title}`,
      html: `
        <h2>${alert.title}</h2>
        <p>${alert.message}</p>
        <p><strong>Sévérité:</strong> ${alert.severity}</p>
      `
    });
  }
}

module.exports = new EmailService();
