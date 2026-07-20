package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "customers")
@PrimaryKeyJoinColumn(name = "customer_id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Customer extends User {

    @Column(name = "address")
    private String address;

    // Getters and Setters that map the old fields into the single JSON field or just provide basic getters
    // If the frontend sends addressLine1 etc, we might need a DTO or just map it.
    // For now, mapping directly to the DB column `address` as per V15.
}
