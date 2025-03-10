--liquibase formatted sql

--changeset test-this-thing:1
CREATE TABLE test_table (
    test_id INT NOT NULL, test_column INT, PRIMARY KEY (test_id)
)
