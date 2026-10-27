package com.valleysoft.store.service;

import com.valleysoft.store.dto.CreateCustomerRequest;
import com.valleysoft.store.entity.Customer;
import com.valleysoft.store.entity.User;
import com.valleysoft.store.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Customer createProfile(User user, CreateCustomerRequest request) {
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setFirstName(request.firstName().trim());
        customer.setLastName(request.lastName().trim());
        customer.setPhone(request.phone() == null || request.phone().isBlank()
                ? null
                : request.phone().trim());
        return customerRepository.save(customer);
    }
}