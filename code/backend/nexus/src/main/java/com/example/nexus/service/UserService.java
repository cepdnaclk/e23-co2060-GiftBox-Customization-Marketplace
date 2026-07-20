package com.example.nexus.service;

import com.example.nexus.dto.AddressDTO;
import com.example.nexus.model.User;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ── Save or update address for a customer ────────────────────────────────
    public boolean saveAddress(String username, AddressDTO addressDTO) {
        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) return false;

        user.setAddressLine1(addressDTO.getAddressLine1());
        user.setAddressLine2(addressDTO.getAddressLine2());
        user.setCity(addressDTO.getCity());
        user.setDistrict(addressDTO.getDistrict());
        user.setProvince(addressDTO.getProvince());
        user.setPostalCode(addressDTO.getPostalCode());
        user.setPhoneNumber(addressDTO.getPhoneNumber());

        userRepository.save(user);
        return true;
    }

    // ── Get address for a customer ────────────────────────────────────────────
    public AddressDTO getAddress(String username) {
        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) return null;

        AddressDTO dto = new AddressDTO();
        dto.setAddressLine1(user.getAddressLine1());
        dto.setAddressLine2(user.getAddressLine2());
        dto.setCity(user.getCity());
        dto.setDistrict(user.getDistrict());
        dto.setProvince(user.getProvince());
        dto.setPostalCode(user.getPostalCode());
        dto.setPhoneNumber(user.getPhoneNumber());

        return dto;
    }
}
