package com.example.nexus.controller;

import com.example.nexus.model.Vendor;
import com.example.nexus.model.Role;
import com.example.nexus.dto.VendorRegisterRequest;
import com.example.nexus.repository.VendorRepository;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
// Allows your React app (running on port 3000) to communicate with this backend
public class VendorController {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    /**
     * Fetches all vendors from the database.
     * Used by both the main Vendors page and the Pending Requests page.
     */
    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    /**
     * Updates the status of a specific vendor (Approve or Reject).
     * @param id The unique ID of the vendor to update.
     * @param status The new status value (e.g., 'ACTIVE' or 'REJECTED').
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Vendor> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        // 1. Retrieve the vendor record by ID, or throw an error if not found
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));

        // 2. Modify the status field
        vendor.setStatus(status);

        // 3. Save the updated record back to the database
        Vendor updatedVendor = vendorRepository.save(vendor);

        // 4. Return the updated object with a 200 OK response
        return ResponseEntity.ok(updatedVendor);
    }

    /**
     * Registers a new vendor application.
     * Vendor extends User under the hood, so a single Vendor instance carries
     * both the account fields and the shop details. Saving it once persists
     * both sides through the shared id.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerVendor(@RequestBody VendorRegisterRequest request) {
        try {
            if (userRepository.existsByUsername(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email/Username already exists"));
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
            }

            Vendor vendor = new Vendor();

            // Account fields
            vendor.setName(request.getOwnerName());
            vendor.setUsername(request.getEmail()); // Use email as username for vendor login
            vendor.setEmail(request.getEmail());
            vendor.setPassword(passwordEncoder.encode(request.getPassword()));
            vendor.setRole(Role.VENDOR);
            vendor.setVerified(true); // Auto-verify email for vendor registration convenience

            // Shop details
            vendor.setShopName(request.getShopName());
            vendor.setFullName(request.getOwnerName());
            vendor.setPhoneNumber(request.getPhone());
            vendor.setShopAddress(request.getAddress() + ", " + request.getCity());
            vendor.setBrNo(request.getBusinessRegNumber());
            vendor.setCategories(request.getCategory());
            vendor.setStatus("PENDING"); // Defaults to PENDING until approved by admin

            vendorRepository.save(vendor);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application submitted successfully! Your shop registration is pending admin approval."
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage(),
                "errorType", e.getClass().getName()
            ));
        }
    }

    /**
     * Fetch a specific vendor by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Integer id) {
        return vendorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update vendor details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(
            @PathVariable Integer id,
            @RequestBody Vendor updatedVendor) {
        return vendorRepository.findById(id).map(vendor -> {
            if (updatedVendor.getShopName() != null) vendor.setShopName(updatedVendor.getShopName());
            if (updatedVendor.getFullName() != null) vendor.setFullName(updatedVendor.getFullName());
            if (updatedVendor.getPhoneNumber() != null) vendor.setPhoneNumber(updatedVendor.getPhoneNumber());
            if (updatedVendor.getShopAddress() != null) vendor.setShopAddress(updatedVendor.getShopAddress());
            if (updatedVendor.getCategories() != null) vendor.setCategories(updatedVendor.getCategories());
            Vendor saved = vendorRepository.save(vendor);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}