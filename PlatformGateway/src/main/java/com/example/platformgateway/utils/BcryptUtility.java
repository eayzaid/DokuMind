package com.example.platformgateway.utils;

import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCrypt;

@NoArgsConstructor
public class BcryptUtility{

    public static boolean isPasswordValid(String password , String correctPasswordHashed ){
        return BCrypt.checkpw(password , correctPasswordHashed);
    }

}