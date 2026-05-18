package org.example.models;

public class EventNotification {
    private String message;
    private String eventTitle;
    private String userName;

    public EventNotification(String message, String eventTitle, String userName) {
        this.message = message;
        this.eventTitle = eventTitle;
        this.userName = userName;
    }

    public String getMessage() { return message; }
    public String getEventTitle() { return eventTitle; }
    public String getUserName() { return userName; }
}