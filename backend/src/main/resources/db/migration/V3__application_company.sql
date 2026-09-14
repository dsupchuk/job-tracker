-- V3: company becomes a first-class column.
-- Until now the company was encoded inside the position string ("Role @ Company"),
-- which made it impossible to sort, filter or match on it. Split the existing
-- rows so `position` holds only the role and `company` holds the company.

ALTER TABLE applications ADD COLUMN company TEXT;

UPDATE applications
SET company  = NULLIF(TRIM(SPLIT_PART(position, ' @ ', 2)), ''),
    position = TRIM(SPLIT_PART(position, ' @ ', 1))
WHERE position LIKE '% @ %';

CREATE INDEX ix_applications_user_company ON applications (user_id, company);
