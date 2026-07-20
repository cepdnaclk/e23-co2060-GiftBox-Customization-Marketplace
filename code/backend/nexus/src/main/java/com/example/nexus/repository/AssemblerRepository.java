package com.example.nexus.repository;

import com.example.nexus.model.Assembler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssemblerRepository extends JpaRepository<Assembler, Integer> {
}
