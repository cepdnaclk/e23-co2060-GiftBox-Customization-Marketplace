package com.example.nexus.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "assemblers")
@PrimaryKeyJoinColumn(name = "assembler_id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Assembler extends User {
    
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "status")
    private String status = "ACTIVE";
}
