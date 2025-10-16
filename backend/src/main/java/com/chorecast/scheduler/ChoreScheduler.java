package com.chorecast.scheduler;

import com.chorecast.model.Chore;
import com.chorecast.model.Reminder;
import com.chorecast.repository.ChoreRepository;
import com.chorecast.repository.ReminderRepository;
import com.chorecast.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChoreScheduler {
    private final ChoreRepository choreRepository;
    private final ReminderRepository reminderRepository;
    private final EmailService emailService;

    @Scheduled(cron = "${app.scheduler.reminder-time}")
    public void processOverdueChores() {
        log.info("Running scheduled task: Processing overdue chores");
        
        List<Chore> overdueChores = choreRepository.findByNextDueBeforeAndCompletedFalse(LocalDateTime.now());
        
        for (Chore chore : overdueChores) {
            createChoreReminder(chore);
        }
        
        log.info("Processed {} overdue chores", overdueChores.size());
    }

    @Scheduled(cron = "${app.scheduler.reminder-time}")
    public void sendDueReminders() {
        log.info("Running scheduled task: Sending due reminders");
        emailService.sendDueReminders();
    }

    @Scheduled(cron = "0 0 2 * * ?") // 2 AM daily
    public void autoGenerateRecurringChores() {
        log.info("Running scheduled task: Auto-generating recurring chores");
        
        List<Chore> completedChores = choreRepository.findAll().stream()
                .filter(Chore::getCompleted)
                .toList();
        
        for (Chore chore : completedChores) {
            if (chore.getNextDue().isBefore(LocalDateTime.now())) {
                // Reset chore for next cycle
                chore.setCompleted(false);
                choreRepository.save(chore);
                log.info("Reset chore: {}", chore.getName());
            }
        }
    }

    private void createChoreReminder(Chore chore) {
        Reminder reminder = Reminder.builder()
                .userId(chore.getAssignedTo())
                .message("🧹 Reminder: It's time to " + chore.getName() + "!")
                .type(Reminder.ReminderType.CHORE)
                .dueDate(LocalDateTime.now())
                .sent(false)
                .build();
        
        reminderRepository.save(reminder);
    }
}
