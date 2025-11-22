package com.dids.repository;

import com.dids.model.Policy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolicyRepository extends MongoRepository<Policy, String> {
}

