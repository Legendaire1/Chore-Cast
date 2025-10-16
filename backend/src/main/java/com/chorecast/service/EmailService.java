package com.chorecast.service;

import com.chorecast.model.Reminder;
import com.chorecast.model.User;
import com.chorecast.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final ReminderRepository reminderRepository;

    public void sendReminder(User user, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(user.getEmail());
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            mailMessage.setFrom("chorecast@noreply.com");
            
            mailSender.send(mailMessage);
            log.info("Reminder email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void sendDueReminders() {
        List<Reminder> dueReminders = reminderRepository.findByDueDateBeforeAndSentFalse(LocalDateTime.now());
        
        for (Reminder reminder : dueReminders) {
            // In a real app, fetch user and send email
            log.info("Sending reminder: {}", reminder.getMessage());
            reminder.setSent(true);
            reminderRepository.save(reminder);
        }
    }
}
