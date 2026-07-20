package com.example.nexus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. Total Customers Count (role = 'CUSTOMER')
            Integer totalCustomers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'", Integer.class);
            response.put("totalCustomers", totalCustomers != null ? totalCustomers : 0);

            // 2. Gift Boxes Created Count
            Integer giftBoxesCreated = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM gift_boxes", Integer.class);
            response.put("giftBoxesCreated", giftBoxesCreated != null ? giftBoxesCreated : 0);

            // 3. Orders Today / Total Orders Count
            Integer totalOrders = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders", Integer.class);
            response.put("totalOrders", totalOrders != null ? totalOrders : 0);

            // 4. Total Revenue (LKR)
            Double totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM orders", Double.class);
            response.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

            // 5. Recent Orders (Latest 5 orders)
            List<Map<String, Object>> recentOrders = jdbcTemplate.queryForList(
                "SELECT order_id AS orderId, recipient_name AS recipientName, wrapping_style AS wrapStyle, status, total_amount AS totalAmount, created_at AS createdAt " +
                "FROM orders ORDER BY order_id DESC LIMIT 5"
            );
            response.put("recentOrders", recentOrders);

            // 6. Top Vendors (with product count)
            List<Map<String, Object>> topVendors = jdbcTemplate.queryForList(
                "SELECT v.vendor_id AS id, v.shop_name AS shopName, COUNT(p.id) AS productCount " +
                "FROM vendors v " +
                "LEFT JOIN products p ON v.vendor_id = p.vendor_id " +
                "GROUP BY v.vendor_id, v.shop_name " +
                "ORDER BY productCount DESC LIMIT 5"
            );
            response.put("topVendors", topVendors);

            // 7. Order Status Distribution (For Pie Chart)
            List<Map<String, Object>> orderStatusDistribution = jdbcTemplate.queryForList(
                "SELECT status AS name, COUNT(*) AS value FROM orders GROUP BY status"
            );
            response.put("orderStatusDistribution", orderStatusDistribution);

            // 8. Monthly Revenue (For Bar Chart) - Last 6 months
            List<Map<String, Object>> monthlyRevenue = jdbcTemplate.queryForList(
                "SELECT DATE_FORMAT(created_at, '%b') AS month, COALESCE(SUM(total_amount), 0) AS revenue " +
                "FROM orders GROUP BY DATE_FORMAT(created_at, '%b'), DATE_FORMAT(created_at, '%Y-%m') ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC LIMIT 6"
            );
            response.put("monthlyRevenue", monthlyRevenue);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
