package com.example.platformgateway.utils;

import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.util.Optional;

@NoArgsConstructor
public class BcryptUtility{

    private final static int defaultLength = 18;

    public static boolean isPasswordValid(String password , String correctPasswordHashed ){
        return BCrypt.checkpw(password , correctPasswordHashed);
    }

    public static String hashPassword(String password){
        return BCrypt.hashpw(password , BCrypt.gensalt());
    }

    public static String generateRandomPassword(){

        final String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder password = new StringBuilder(defaultLength);
        for (int i = 0; i < defaultLength; i++){
            password.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return password.toString();
    }
}