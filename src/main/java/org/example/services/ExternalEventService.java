package org.example.services;

import org.example.models.Event;
import org.example.repositories.EventRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service // Tells Spring to manage this class
public class ExternalEventService {
    private final String API_KEY = "vtv6j8aRfJlKG2EvTvB8Q36fs7kt4gzb";
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private EventRepository eventRepository; // Allows us to save to DB

    public void fetchAndSaveEvents(Double lat, Double lon) {
        String latLonStr = lat + "," + lon;
        // Radius set to 50 miles/km depending on Ticketmaster settings
        String url = String.format("https://app.ticketmaster.com/discovery/v2/events.json?apikey=%s&latlong=%s&radius=50&size=100", API_KEY, latLonStr);

        try {
            String response = restTemplate.getForObject(url, String.class);
            JSONObject json = new JSONObject(response);

            // Safety check: if no events are found, stop here
            if (!json.has("_embedded")) {
                System.out.println("No external events found in this area.");
                return;
            }

            JSONArray events = json.getJSONObject("_embedded").getJSONArray("events");

            for (int i = 0; i < events.length(); i++) {
                JSONObject e = events.getJSONObject(i);
                String title = e.getString("name");

                // Check if we already have this event by title to avoid duplicates
                if (eventRepository.findByTitle(title).isPresent()) {
                    continue;
                }

                // Create a new Event object and map JSON fields to it
                Event event = new Event();
                event.setTitle(title);
                event.setDescription("Synced from Ticketmaster");
                event.setCategory("External");
                event.setPrice(0.0);
                event.setStatus("UPCOMING");

                // Extract coordinates from the JSON
                JSONObject location = e.getJSONObject("_embedded")
                        .getJSONArray("venues")
                        .getJSONObject(0)
                        .getJSONObject("location");

                event.setLatitude(location.getDouble("latitude"));
                event.setLongitude(location.getDouble("longitude"));

                // Save to MySQL
                eventRepository.save(event);
                System.out.println("Saved new event: " + title);
            }
        } catch (Exception e) {
            System.out.println("Error processing external events: " + e.getMessage());
        }
    }
}