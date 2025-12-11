USE routy;

-- ===============================
-- 1. DROP TABLE (자식 → 부모 순)
-- ===============================
DROP TABLE IF EXISTS tbl_reviewfiles;
DROP TABLE IF EXISTS tbl_like;
DROP TABLE IF EXISTS tbl_bookmark;
DROP TABLE IF EXISTS tbl_travel;
DROP TABLE IF EXISTS tbl_duration;
DROP TABLE IF EXISTS tbl_review;
DROP TABLE IF EXISTS tbl_plan;
DROP TABLE IF EXISTS tbl_region;
DROP TABLE IF EXISTS tbl_user;
DROP TABLE IF EXISTS tbl_class;

-- ===============================
-- 2. CREATE TABLE (부모 → 자식 순)
-- ===============================

CREATE TABLE tbl_class (
    class_id INTEGER NOT NULL AUTO_INCREMENT,
    class_name VARCHAR(20) NOT NULL,
    class_code VARCHAR(20) NOT NULL,
    PRIMARY KEY (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_region (
    region_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '지역 식별자',
    region_name VARCHAR(20) NOT NULL COMMENT '지역 이름',
    admin_code INT DEFAULT NULL COMMENT '행정안전부 공식 코드',
    theme VARCHAR(50) DEFAULT NULL COMMENT '여행 테마 (예: 바다 / 맛집)',
    region_desc VARCHAR(100) DEFAULT NULL COMMENT '간단한 지역 설명',
    start_lat DECIMAL(10, 8) DEFAULT NULL COMMENT '시작 지점 위도',
    start_lng DECIMAL(11, 8) DEFAULT NULL COMMENT '시작 지점 경도'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_user (
    user_no INTEGER NOT NULL AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL COMMENT 'UNIQUE',
    username VARCHAR(20) NOT NULL,
    password CHAR(60) NULL COMMENT 'BCrypt 암호화 적용',
    age INTEGER NULL,
    gender VARCHAR(10) NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    image_url VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    PRIMARY KEY (user_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_plan (
    plan_id INTEGER NOT NULL AUTO_INCREMENT,
    plan_title VARCHAR(255) NOT NULL,
    is_public TINYINT(1) NOT NULL DEFAULT 0,
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20) NOT NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at VARCHAR(20) NOT NULL,
    updated_at VARCHAR(20) NULL,
    bookmark_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    region_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    theme VARCHAR(50) NULL COMMENT '여행 테마 (restaurant/cafe/tourist)',
    PRIMARY KEY (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_duration (
    duration_id INTEGER NOT NULL AUTO_INCREMENT,
    day INTEGER NOT NULL COMMENT '실제 일수',
    plan_id INTEGER NOT NULL,
    PRIMARY KEY (duration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_travel (
    travel_id INTEGER NOT NULL AUTO_INCREMENT,
    travel_order INTEGER NULL DEFAULT 1,
    estimated_travel_time INTEGER NULL DEFAULT 0,
    place_name VARCHAR(200) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    category_code VARCHAR(20) NULL,
    category_group_name VARCHAR(50) NULL,
    address_name VARCHAR(100) NULL,
    place_url VARCHAR(255) NULL,
    description TEXT NULL,
    image_path VARCHAR(255) NULL,
    run_time VARCHAR(255) NULL,
    start_time VARCHAR(20) NULL COMMENT '방문 시작 시간',
    end_time VARCHAR(20) NULL COMMENT '방문 종료 시간',
    duration_id INTEGER NULL,
    PRIMARY KEY (travel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_review (
    review_id INTEGER NOT NULL AUTO_INCREMENT,
    content TEXT NULL,
    created_at VARCHAR(20) NOT NULL,
    updated_at VARCHAR(20) NULL,
    rating INTEGER NOT NULL DEFAULT 0,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    plan_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_reviewfiles (
    reviewfile_id INTEGER NOT NULL AUTO_INCREMENT,
    file_name VARCHAR(255) NULL,
    file_rename VARCHAR(255) NULL,
    file_path VARCHAR(255) NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    review_id INTEGER NOT NULL,
    PRIMARY KEY (reviewfile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_bookmark (
    bookmark_id INTEGER NOT NULL AUTO_INCREMENT,
    created_at VARCHAR(20) NOT NULL,
    plan_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (bookmark_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tbl_like (
    like_id INTEGER NOT NULL AUTO_INCREMENT,
    plan_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (like_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===============================
-- 3. FOREIGN KEY 제약조건
-- ===============================

ALTER TABLE tbl_duration
ADD CONSTRAINT fk_plan_duration FOREIGN KEY (plan_id)
REFERENCES tbl_plan (plan_id);

ALTER TABLE tbl_travel
ADD CONSTRAINT fk_duration_travel FOREIGN KEY (duration_id)
REFERENCES tbl_duration (duration_id);

ALTER TABLE tbl_plan
ADD CONSTRAINT fk_region_plan FOREIGN KEY (region_id)
REFERENCES tbl_region (region_id);

ALTER TABLE tbl_plan
ADD CONSTRAINT fk_user_plan FOREIGN KEY (user_id)
REFERENCES tbl_user (user_no);

ALTER TABLE tbl_bookmark
ADD CONSTRAINT fk_plan_bookmark FOREIGN KEY (plan_id)
REFERENCES tbl_plan (plan_id);

ALTER TABLE tbl_bookmark
ADD CONSTRAINT fk_user_bookmark FOREIGN KEY (user_id)
REFERENCES tbl_user (user_no);

ALTER TABLE tbl_reviewfiles
ADD CONSTRAINT fk_review_reviewfiles FOREIGN KEY (review_id)
REFERENCES tbl_review (review_id);

ALTER TABLE tbl_review
ADD CONSTRAINT fk_review_plan FOREIGN KEY (plan_id)
REFERENCES tbl_plan (plan_id);

ALTER TABLE tbl_review
ADD CONSTRAINT fk_review_user FOREIGN KEY (user_id)
REFERENCES tbl_user (user_no);

ALTER TABLE tbl_like
ADD CONSTRAINT fk_plan_like FOREIGN KEY (plan_id)
REFERENCES tbl_plan (plan_id);

ALTER TABLE tbl_like
ADD CONSTRAINT fk_user_like FOREIGN KEY (user_id)
REFERENCES tbl_user (user_no);

-- ===============================
-- 4. UNIQUE 제약조건
-- ===============================

ALTER TABLE tbl_user
ADD CONSTRAINT uq_user_email UNIQUE (email);

ALTER TABLE tbl_like
ADD CONSTRAINT uq_like_plan_user UNIQUE (plan_id, user_id);

ALTER TABLE tbl_bookmark
ADD CONSTRAINT uq_bookmark_plan_user UNIQUE (plan_id, user_id);

ALTER TABLE tbl_review
ADD CONSTRAINT uq_review_plan UNIQUE (plan_id);

DESCRIBE tbl_user;
DESCRIBE tbl_region;
DESCRIBE tbl_class;
DESCRIBE tbl_review;
DESCRIBE tbl_reviewfiles;
DESCRIBE tbl_bookmark;
DESCRIBE tbl_like;
DESCRIBE tbl_duration;
DESCRIBE tbl_plan;
DESCRIBE tbl_travel;