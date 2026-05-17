package org.example.services;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getWeatherDescription(Double lat, Double lon) {
        try {
            String url = String.format(
                    "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s",
                    lat, lon, apiKey
            );

            String response = restTemplate.getForObject(url, String.class);

            JSONObject json = new JSONObject(response);
            String description = json.getJSONArray("weather").getJSONObject(0).getString("description");
            double temp = json.getJSONObject("main").getDouble("temp");

            return description + " (" + temp + "°C)";
        } catch (Exception e) {
            return "Weather data unavailable";
        }
    }
}