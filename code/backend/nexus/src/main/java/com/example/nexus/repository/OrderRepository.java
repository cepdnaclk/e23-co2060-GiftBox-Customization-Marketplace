package com.example.nexus.repository;

import com.example.nexus.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Orders page — vendor orders sorted by date
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN OrderItem oi ON o.orderId = oi.orderId LEFT JOIN Product p ON oi.productId = p.id WHERE o.vendorId = :vendorId OR p.vendorId = :vendorId ORDER BY o.createdAt DESC")
    List<Order> findByVendorIdOrderByCreatedAtDesc(@Param("vendorId") Integer vendorId);

    // Customer orders — only this customer's orders
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Integer customerId);

    // Dashboard — orders count today
    @Query(value = "SELECT COUNT(DISTINCT o.order_id) FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.vendor_id = :vendorId AND DATE(o.created_at) = CURDATE()", nativeQuery = true)
    long countOrdersTodayByVendorId(@Param("vendorId") Integer vendorId);

    // Dashboard — revenue today
    @Query(value = "SELECT SUM(oi.subtotal) FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.vendor_id = :vendorId AND DATE(o.created_at) = CURDATE() AND o.status != 'CANCELLED'", nativeQuery = true)
    Double getRevenueTodayByVendorId(@Param("vendorId") Integer vendorId);

    // Dashboard — weekly orders + revenue (last 7 days)
    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%a') as day, COUNT(DISTINCT o.order_id) as orders, SUM(oi.subtotal) as revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.vendor_id = :vendorId AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(o.created_at), DATE_FORMAT(o.created_at, '%a') ORDER BY DATE(o.created_at)", nativeQuery = true)
    List<Object[]> getWeeklyOrdersAndRevenue(@Param("vendorId") Integer vendorId);

    // Dashboard — monthly revenue (last 7 months)
    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%b') as month, SUM(oi.subtotal) as revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.vendor_id = :vendorId AND o.status != 'CANCELLED' AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 MONTH) GROUP BY YEAR(o.created_at), MONTH(o.created_at), DATE_FORMAT(o.created_at, '%b') ORDER BY YEAR(o.created_at), MONTH(o.created_at)", nativeQuery = true)
    List<Object[]> getMonthlyRevenue(@Param("vendorId") Integer vendorId);

    // Dashboard — order status distribution
    @Query(value = "SELECT o.status, COUNT(DISTINCT o.order_id) as count FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.vendor_id = :vendorId GROUP BY o.status", nativeQuery = true)
    List<Object[]> getOrderStatusDistribution(@Param("vendorId") Integer vendorId);
}