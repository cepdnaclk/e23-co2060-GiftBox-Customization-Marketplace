package com.example.nexus.controller;

import com.example.nexus.dto.CreateOrderRequest;
import com.example.nexus.model.Order;
import com.example.nexus.model.OrderItem;
import com.example.nexus.model.Product;
import com.example.nexus.repository.OrderRepository;
import com.example.nexus.repository.OrderItemRepository;
import com.example.nexus.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    // 1. Vendor-specific orders retrieval (sorted by created_at desc)
    @GetMapping("/vendors/{vendorId}/orders")
    public List<Order> getOrdersByVendor(@PathVariable Integer vendorId) {
        return orderRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    // 1b. Customer-specific orders retrieval — each customer sees ONLY their own orders
    @GetMapping("/customers/{customerId}/orders")
    public List<Order> getOrdersByCustomer(@PathVariable Integer customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    // 1c. Customer-specific orders summary
    @GetMapping("/orders/customer/{customerId}/summary")
    public ResponseEntity<?> getCustomerOrderSummary(@PathVariable Integer customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        
        int totalOrders = orders.size();
        int delivered = 0;
        int inProgress = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Order order : orders) {
            String status = order.getStatus();
            if ("DELIVERED".equalsIgnoreCase(status)) {
                delivered++;
            } else if ("PENDING".equalsIgnoreCase(status) || "CONFIRMED".equalsIgnoreCase(status) || "SHIPPED".equalsIgnoreCase(status)) {
                inProgress++;
            }
            if (!"CANCELLED".equalsIgnoreCase(status)) {
                totalSpent = totalSpent.add(order.getTotalAmount());
            }
        }

        Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalOrders", totalOrders);
        summary.put("delivered", delivered);
        summary.put("inProgress", inProgress);
        summary.put("totalSpent", totalSpent);

        return ResponseEntity.ok(summary);
    }

    // 2. Order status update (Vendor or Customer)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId, @RequestBody Map<String, String> request) {
        return orderRepository.findById(orderId).map(order -> {
            String newStatus = request.get("status");
            String currentStatus = order.getStatus();

            // Allow vendor to change PENDING to CONFIRMED or CANCELLED
            if ("PENDING".equals(currentStatus) && ("CONFIRMED".equals(newStatus) || "CANCELLED".equals(newStatus))) {
                order.setStatus(newStatus);
                orderRepository.save(order);
                return ResponseEntity.ok().body("Order " + newStatus);
            }
            
            // Allow customer to mark as RECEIVED if it's currently DELIVERED
            if ("RECEIVED".equals(newStatus) && "DELIVERED".equals(currentStatus)) {
                order.setStatus(newStatus);
                orderRepository.save(order);
                return ResponseEntity.ok().body("Order marked as RECEIVED");
            }

            return ResponseEntity.badRequest().body("Action not allowed for current status");
        }).orElse(ResponseEntity.notFound().build());
    }

    // 2b. Get items for an order
    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable Integer orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<Map<String, Object>> response = new java.util.ArrayList<>();
        
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("productId", item.getProductId());
            map.put("quantity", item.getQuantity());
            map.put("unitPrice", item.getUnitPrice());
            if (product != null) {
                map.put("name", product.getName());
                map.put("imageUrl", product.getImageUrl());
            } else {
                map.put("name", "Unknown Product");
            }
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    // 3. Place custom box order
    @PostMapping("/orders/custom-box")
    @Transactional
    public ResponseEntity<?> placeCustomBoxOrder(@RequestBody CreateOrderRequest request) {
        try {
            // Validate request
            if (request.getCustomerId() == null) {
                return ResponseEntity.badRequest().body("Validation Error: customerId is required.");
            }
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: deliveryAddress is required.");
            }
            if (request.getBoxSize() == null || request.getBoxSize().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: boxSize is required for custom boxes.");
            }
            if (request.getRecipientName() == null || request.getRecipientName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: recipientName is required for custom boxes.");
            }
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: items list cannot be empty.");
            }

            BigDecimal totalAmount = BigDecimal.ZERO;

            // Calculate box fee
            BigDecimal boxFee = getBoxFee(request.getBoxSize());
            totalAmount = totalAmount.add(boxFee);

            // Fetch products and calculate total items price, check stock
            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));
                
                int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                if (stock < itemReq.getQuantity()) {
                    return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getName());
                }

                BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                totalAmount = totalAmount.add(itemSubtotal);
            }

            // Create and save the Order
            Order order = new Order();
            order.setCustomerId(request.getCustomerId());
            order.setVendorId(null); // Multi-vendor order, no specific vendor assigned
            order.setDeliveryAddress(request.getDeliveryAddress());
            order.setOccasion(request.getOccasion());
            order.setBoxSize(request.getBoxSize());
            order.setGiftMessage(request.getGiftMessage());
            order.setRecipientName(request.getRecipientName());
            order.setWrappingStyle(request.getWrappingStyle());
            order.setStatus("PENDING");
            order.setOrderType("CUSTOM_BOX");
            order.setTotalAmount(totalAmount);

            Order savedOrder = orderRepository.save(order);

            // Save OrderItems and update product stock
            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId()).get();
                
                // Decrement stock gracefully
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                product.setStockQuantity(currentStock - itemReq.getQuantity());
                productRepository.save(product);

                // Create OrderItem
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(savedOrder.getOrderId());
                orderItem.setProductId(product.getId());
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setUnitPrice(product.getPrice());
                
                orderItemRepository.save(orderItem);
            }
            
            // Build a safe response map to prevent Jackson serialization issues
            java.util.Map<String, Object> orderDto = new java.util.HashMap<>();
            orderDto.put("orderId", savedOrder.getOrderId());
            orderDto.put("vendorId", savedOrder.getVendorId());
            orderDto.put("orderType", savedOrder.getOrderType());
            orderDto.put("totalAmount", savedOrder.getTotalAmount());
            orderDto.put("status", savedOrder.getStatus());
            orderDto.put("createdAt", savedOrder.getCreatedAt());

            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body("Error: " + e.getMessage() + "\n" + sw.toString());
        }
    }

    // 4. Place standard cart order (multi-vendor split)
    @PostMapping("/orders/standard")
    @Transactional
    public ResponseEntity<?> placeStandardOrder(@RequestBody CreateOrderRequest request) {
        try {
            // Validate request
            if (request.getCustomerId() == null) {
                return ResponseEntity.badRequest().body("Validation Error: customerId is required.");
            }
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: deliveryAddress is required.");
            }
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Validation Error: items list cannot be empty.");
            }

            // Group items by vendorId
            java.util.Map<Integer, java.util.List<CreateOrderRequest.OrderItemRequest>> itemsByVendor = new java.util.HashMap<>();
            for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));
                
                int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                if (stock < itemReq.getQuantity()) {
                    return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getName());
                }
                
                itemsByVendor.computeIfAbsent(product.getVendorId(), k -> new java.util.ArrayList<>()).add(itemReq);
            }

            java.util.List<java.util.Map<String, Object>> responseList = new java.util.ArrayList<>();

            // Create one order per vendor
            for (java.util.Map.Entry<Integer, java.util.List<CreateOrderRequest.OrderItemRequest>> entry : itemsByVendor.entrySet()) {
                Integer vendorId = entry.getKey();
                java.util.List<CreateOrderRequest.OrderItemRequest> vendorItems = entry.getValue();

                BigDecimal totalAmount = BigDecimal.ZERO;
                for (CreateOrderRequest.OrderItemRequest itemReq : vendorItems) {
                    Product product = productRepository.findById(itemReq.getProductId()).get();
                    BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                    totalAmount = totalAmount.add(itemSubtotal);
                }

                Order order = new Order();
                order.setCustomerId(request.getCustomerId());
                order.setVendorId(vendorId);
                order.setDeliveryAddress(request.getDeliveryAddress());
                order.setStatus("PENDING");
                order.setOrderType("STANDARD");
                order.setTotalAmount(totalAmount);

                Order savedOrder = orderRepository.save(order);

                for (CreateOrderRequest.OrderItemRequest itemReq : vendorItems) {
                    Product product = productRepository.findById(itemReq.getProductId()).get();
                    
                    // Decrement stock gracefully
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    product.setStockQuantity(currentStock - itemReq.getQuantity());
                    productRepository.save(product);

                    // Create OrderItem
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrderId(savedOrder.getOrderId());
                    orderItem.setProductId(product.getId());
                    orderItem.setQuantity(itemReq.getQuantity());
                    orderItem.setUnitPrice(product.getPrice());
                    
                    orderItemRepository.save(orderItem);
                }
                
                // Build a safe response map to prevent Jackson serialization issues
                java.util.Map<String, Object> orderDto = new java.util.HashMap<>();
                orderDto.put("orderId", savedOrder.getOrderId());
                orderDto.put("vendorId", savedOrder.getVendorId());
                orderDto.put("orderType", savedOrder.getOrderType());
                orderDto.put("totalAmount", savedOrder.getTotalAmount());
                orderDto.put("status", savedOrder.getStatus());
                orderDto.put("createdAt", savedOrder.getCreatedAt());
                responseList.add(orderDto);
            }

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body("Error: " + e.getMessage() + "\n" + sw.toString());
        }
    }

    private BigDecimal getBoxFee(String boxSize) {
        if ("SMALL".equalsIgnoreCase(boxSize)) {
            return new BigDecimal("500");
        } else if ("MEDIUM".equalsIgnoreCase(boxSize)) {
            return new BigDecimal("800");
        } else if ("LARGE".equalsIgnoreCase(boxSize)) {
            return new BigDecimal("1200");
        }
        return BigDecimal.ZERO;
    }
}