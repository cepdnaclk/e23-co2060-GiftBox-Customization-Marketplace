package com.example.nexus.controller;

import com.example.nexus.model.Assembler;
import com.example.nexus.model.Role;
import com.example.nexus.repository.AssemblerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/assemblers")
public class AssemblerController {

    @Autowired
    private AssemblerRepository assemblerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getAllAssemblers() {
        String sql = "SELECT a.assembler_id AS assemblerId, a.full_name AS fullName, a.phone_number AS phone, a.status AS status, " +
                     "u.email AS email, u.created_at AS createdAt, " +
                     "(SELECT COUNT(*) FROM orders o WHERE o.assembler_id = a.assembler_id AND o.status = 'DELIVERED') AS completedOrders " +
                     "FROM assemblers a " +
                     "JOIN users u ON a.assembler_id = u.user_id";
        
        List<Map<String, Object>> assemblers = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(assemblers);
    }

    @PostMapping
    public ResponseEntity<?> createAssembler(@RequestBody Map<String, String> payload) {
        try {
            Assembler assembler = new Assembler();
            assembler.setFullName(payload.get("fullName"));
            assembler.setEmail(payload.get("email"));
            assembler.setUsername(payload.get("email")); // fallback username to email
            assembler.setPhoneNumber(payload.get("phone"));
            assembler.setPassword(passwordEncoder.encode(payload.get("password")));
            assembler.setRole(Role.ASSEMBLER);
            assembler.setVerified(true);
            assembler.setStatus(payload.getOrDefault("status", "ACTIVE"));

            Assembler saved = assemblerRepository.save(assembler);
            
            return ResponseEntity.ok(Map.of(
                    "assemblerId", saved.getId(),
                    "fullName", saved.getFullName(),
                    "email", saved.getEmail(),
                    "phone", saved.getPhoneNumber(),
                    "status", saved.getStatus(),
                    "completedOrders", 0,
                    "createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestParam String status) {
        Optional<Assembler> optAssembler = assemblerRepository.findById(id);
        if (optAssembler.isPresent()) {
            Assembler assembler = optAssembler.get();
            assembler.setStatus(status);
            assemblerRepository.save(assembler);
            return ResponseEntity.ok(assembler);
        }
        return ResponseEntity.notFound().build();
    }
}
