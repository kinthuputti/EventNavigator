package org.example.services;

import org.example.models.User;
import org.example.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

    @Service
    public class UserService {

        private final UserRepository userRepository;
        private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        public UserService(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        public String registerUser(User user) {
            // Check if email already exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return "Email already registered!";
            }

            // Hash the password
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Save the user to the DB
            userRepository.save(user);
            return "Registration successful!";
        }
    }
