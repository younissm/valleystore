package com.valleysoft.store.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(length = 100)
    private String brand;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "featured", nullable = false)
    private Boolean featured = false;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt = Instant.now();
}