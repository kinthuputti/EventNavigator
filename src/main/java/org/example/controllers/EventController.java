package org.example.controllers;

import org.example.models.Event;
import org.example.models.User;
import org.example.repositories.EventRepository;
import org.example.repositories.UserRepository;
import org.example.services.ExternalEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/events")
public class EventController {
    private final EventRepository eventRepository;
    private final ExternalEventService externalEventService ;
    private final UserRepository userRepository;

    @Autowired
    public EventController(EventRepository eventRepository,ExternalEventService externalEventService,UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.externalEventService = externalEventService;
        this.userRepository = userRepository;
    }
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        event.setCurrentAttendees(0);
        return ResponseEntity.ok(eventRepository.save(event));
    }

    //all events
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    //specific event
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return eventRepository.findById(id).map(existing -> {
            existing.setTitle(event.getTitle());
            existing.setDescription(event.getDescription());
            existing.setLocation(event.getLocation());
            existing.setDateTime(event.getDateTime());
            existing.setCategory(event.getCategory());
            existing.setMaxAttendees(event.getMaxAttendees());
            existing.setPrice(event.getPrice());
            existing.setStatus(event.getStatus());


            return ResponseEntity.ok(eventRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete Event
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    // Math for Haversine Formula (Distance Calculation)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        return dist * 60 * 1.1515 * 1.609344; // Result in Kilometers
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Event>> getNearbyEvents(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam Double radius) {

        // Step 1: Fetch and save new events from the external API
        externalEventService.fetchAndSaveEvents(lat, lon);

        // Step 2: Now find everything in the DB within the radius
        List<Event> allEvents = eventRepository.findAll();
        List<Event> nearbyEvents = allEvents.stream()
                .filter(e -> e.getLatitude() != null && e.getLongitude() != null)
                .filter(e -> calculateDistance(lat, lon, e.getLatitude(), e.getLongitude()) <= radius)
                .toList();

        return ResponseEntity.ok(nearbyEvents);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinEvent(@PathVariable Long id, java.security.Principal principal) {
        // 1. Find the event
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 2. Get the logged-in user from the JWT Token
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Business Logic: Check if already joined or if full
        if (event.getAttendees().contains(user)) {
            return ResponseEntity.badRequest().body("You have already joined this event!");
        }

        if (event.getCurrentAttendees() >= event.getMaxAttendees()) {
            return ResponseEntity.badRequest().body("This event is at full capacity!");
        }

        // 4. Save the relationship
        event.getAttendees().add(user);
        event.setCurrentAttendees(event.getCurrentAttendees() + 1);
        eventRepository.save(event);

        return ResponseEntity.ok("Successfully joined: " + event.getTitle());
    }
}

