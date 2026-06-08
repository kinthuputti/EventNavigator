package org.example.services;

import org.example.models.Event;
import org.example.repositories.EventRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalEventService {

    @Value("${ticketmaster.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private EventRepository eventRepository;

    public void fetchAndSaveEvents(Double lat, Double lon) {
        String latLonStr = lat + "," + lon;
        String url = String.format(
                "https://app.ticketmaster.com/discovery/v2/events.json?apikey=%s&latlong=%s&radius=50&size=100",
                apiKey, latLonStr
        );

        try {
            String response = restTemplate.getForObject(url, String.class);
            JSONObject json = new JSONObject(response);

            if (!json.has("_embedded")) {
                System.out.println("No external events found in this area.");
                return;
            }

            JSONArray events = json.getJSONObject("_embedded").getJSONArray("events");

            for (int i = 0; i < events.length(); i++) {
                JSONObject e = events.getJSONObject(i);
                String title = e.getString("name");

                if (eventRepository.findByTitle(title).isPresent()) {
                    continue;
                }

                Event event = new Event();
                event.setTitle(title);
                event.setDescription("Synced from Ticketmaster");
                event.setCategory("External");
                event.setPrice(0.0);
                event.setStatus("UPCOMING");

                JSONObject location = e.getJSONObject("_embedded")
                        .getJSONArray("venues")
                        .getJSONObject(0)
                        .getJSONObject("location");

                event.setLatitude(location.getDouble("latitude"));
                event.setLongitude(location.getDouble("longitude"));

                eventRepository.save(event);
                System.out.println("Saved new event: " + title);
            }
        } catch (Exception e) {
            System.out.println("Error processing external events: " + e.getMessage());
        }
    }
}