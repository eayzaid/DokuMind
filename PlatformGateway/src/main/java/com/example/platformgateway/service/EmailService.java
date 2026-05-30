package com.example.platformgateway.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.Getter;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

  @Value("${email.templates.welcome.subject}")
  private String welcomeSubject;

  @Value("${email.templates.welcome.bodyText}")
  private String welcomeBodyText;

  @Value("${email.templates.reset.subject}")
  private String resetSubject;

  @Value("${email.templates.reset.bodyText}")
  private String resetBodyText;

  @Value("${spring.mail.username}")
  private String senderEmail;

  private final String htmlTemplate;
  private final JavaMailSender mailSender;

  public EmailService( JavaMailSender mailSender ) {
    this.htmlTemplate = loadHtmlTemplate();
    this.mailSender = mailSender;
  }

  private String loadHtmlTemplate() {
    try (var inputStream = new ClassPathResource("templates/credentials-email.html").getInputStream()) {
      return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to load email HTML template", ex);
    }
  }

  public EmailDetails buildEmailDetails(String email, String password, boolean isNew) {
    return new EmailDetails(
        email,
        password,
        isNew,
        welcomeSubject,
        welcomeBodyText,
        resetSubject,
        resetBodyText,
        htmlTemplate
    );
  }

  public void sendEmail(EmailDetails emailDetails) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    helper.setFrom(senderEmail);
    helper.setTo(emailDetails.getRecipient());
    helper.setSubject(emailDetails.getSubject());
    helper.setText(emailDetails.getBody(), true);

    mailSender.send(message);
  }

  @Getter
  static class EmailDetails {
    private final String recipient;
    private final String subject;
    private final String body;

    public EmailDetails(
        String email,
        String password,
        Boolean isNew,
        String welcomeSubject,
        String welcomeBodyText,
        String resetSubject,
        String resetBodyText,
        String htmlTemplate
    ) {
      this.recipient = email;
      if (isNew) {
        this.subject = welcomeSubject;
        this.body = renderTemplate(htmlTemplate, email, password, welcomeBodyText);
      } else {
        this.subject = resetSubject;
        this.body = renderTemplate(htmlTemplate, email, password, resetBodyText);
      }
    }

    private static String renderTemplate(String template, String email, String password, String bodyText) {
      return template
          .replace("{email}", email)
          .replace("{password}", password)
          .replace("{body}", bodyText);
    }
  }


}
