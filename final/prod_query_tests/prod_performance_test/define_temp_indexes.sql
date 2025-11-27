-- MySQL requires every foreign key column to have an index. In our schema, some of these required indexes
-- were implicitly satisfied by composite indexes that we originally created in define_indexes.sql. Because
-- foreign keys can “reuse” any index that covers their columns, MySQL chose to use those composite indexes
-- to enforce the constraints. As a result, attempting to directly drop the composite indexes causes an error.
--
-- To safely remove the composite indexes for benchmarking, we first create explicit single-column indexes
-- on the foreign key fields (`driverId` in `results` and `circuitId` in `races`). These replacement indexes
-- take over the foreign key requirements, allowing the composite indexes to be dropped without violating
-- referential integrity.

CREATE INDEX driverId ON results(driverId);
CREATE INDEX circuitId ON races(circuitId);
