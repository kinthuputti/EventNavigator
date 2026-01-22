package org.example.services;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {
    private final String API_KEY = "1048a36adf806e515a7bb469ba37c63e";
    private final RestTemplate restTemplate = new RestTemplate();

    public String getWeatherDescription(Double lat, Double lon) {
        try {

            String url = String.format("https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s", lat, lon, API_KEY);

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
