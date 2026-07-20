package com.example.nexus.controller;

import com.example.nexus.model.Category;
import com.example.nexus.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Returns all root (parent) categories with their subcategories as a safe DTO tree.
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCategoryTree() {
        try {
            List<Category> allCategories = categoryRepository.findAll();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Category cat : allCategories) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", cat.getId());
                map.put("name", cat.getName());
                result.add(map);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("error", e.getClass().getSimpleName());
            err.put("message", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    /**
     * Returns a flat list of all subcategories (where parent is not NULL).
     */
    @GetMapping("/subcategories")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFlatSubcategories() {
        List<Map<String, Object>> result = new ArrayList<>();
        categoryRepository.findAll().stream()
                .filter(c -> c.getParent() != null)
                .forEach(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("name", c.getName());
                    result.add(m);
                });
        return result;
    }

    /**
     * Creates a new root category.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Category name is required"));
            }
            Category cat = new Category();
            cat.setName(name);
            Category saved = categoryRepository.save(cat);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
        } catch (Exception e) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("error", e.getClass().getSimpleName());
            err.put("message", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}
