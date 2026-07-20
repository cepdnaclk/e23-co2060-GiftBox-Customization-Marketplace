package com.example.nexus.repository;

import com.example.nexus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}