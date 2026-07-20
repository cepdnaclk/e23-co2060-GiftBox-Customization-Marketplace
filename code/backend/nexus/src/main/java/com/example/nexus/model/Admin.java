package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "admin_id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {
    // Admin specific fields if any
}
