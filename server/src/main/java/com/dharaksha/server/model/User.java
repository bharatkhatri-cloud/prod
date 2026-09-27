package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "users")
public class User implements java.security.Principal {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String role;

    private String password;

    private Date created_on = new Date();

    private Boolean isActive = true;

    private Date updated_at = new Date();
}
