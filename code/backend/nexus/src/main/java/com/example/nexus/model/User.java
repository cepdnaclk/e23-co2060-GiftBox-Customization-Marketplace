package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    private String name;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.CUSTOMER;

    // Email verification fields
    private boolean isVerified = false;
    private String verificationCode;
    private LocalDateTime codeExpiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Address fields (kept on User for global access, or to map V7 schema)
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String district;
    private String province;
    private String postalCode;
    private String phoneNumber;

    @Column(columnDefinition = "LONGTEXT")
    private String profileImageUrl;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
