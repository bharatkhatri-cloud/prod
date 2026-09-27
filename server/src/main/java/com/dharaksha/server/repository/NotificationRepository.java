package com.dharaksha.server.repository;

import com.dharaksha.server.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// This interface is like a library assistant.
// It helps our program search for, save, and delete notifications in our MongoDB database.
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Find all notifications for a specific user, sorted and split into pages.
    List<Notification> findByUserId(String userId, Pageable pageable);

    // Find all notifications for a specific user filtered by their read/unread status.
    List<Notification> findByUserIdAndIsRead(String userId, boolean isRead, Pageable pageable);

    // Count how many unread notifications a specific user has.
    long countByUserIdAndIsRead(String userId, boolean isRead);

    // Find all notifications for a specific user matching a certain category.
    List<Notification> findByUserIdAndCategory(String userId, String category, Pageable pageable);

    // Count the total number of notifications a specific user has in the database.
    long countByUserId(String userId);
}
