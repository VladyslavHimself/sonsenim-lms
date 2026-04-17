# User Entity Specification

This document defines the rules for validation, transformation, and storage of core user data within the system. All validation schemas (Zod, Backend, or Database constraints) must adhere to these rules.

## Data Processing Principles
1. **Sanitization First**: All string fields must undergo `.trim()` before validation.
2. **Case Insensitivity**: `email` and `username` are always stored and compared in lowercase (`toLowerCase`).
3. **Unicode Support**: Name fields must support any language script (UTF-8).

---

## Field Details

### 1. Username
Used for unique identification and public URL generation.

| Parameter | Value |
| :--- | :--- |
| **Type** | String (Unique, Indexed) |
| **Length** | 3 – 39 characters |
| **Allowed Characters** | `a-z`, `0-9`, `-`, `_` |
| **Transformation** | `trim()`, `toLowerCase()` |

**Additional Rules:**
- Cannot start or end with `-` or `_`.
- Consecutive special characters (e.g., `my--name`) are prohibited.
- Must be a valid URL slug component.

### 2. Email Address
The primary identifier for communication and account recovery.

| Parameter | Value |
| :--- | :--- |
| **Type** | String (Unique, Indexed) |
| **Format** | Valid RFC email address |
| **Transformation** | `trim()`, `toLowerCase()` |

**Business Logic:**
- Uniqueness is enforced in lowercase to prevent duplicates (e.g., `User@gm.com` and `user@gm.com` are the same account).

### 3. First Name & Last Name
| Parameter | Value |
| :--- | :--- |
| **Type** | String |
| **Length** | 1 – 100 characters |
| **Allowed Characters** | Any Unicode letters, spaces, hyphens, apostrophes |
| **Transformation** | `trim()` |

**Constraints:**
- Numeric characters are prohibited.
- HTML tags (`<`, `>`) are prohibited to prevent XSS (Cross-Site Scripting).

### 4. Password
| Parameter | Value |
| :--- | :--- |
| **Type** | String (Stored as Hash) |
| **Length** | 8 – 128 characters |
| **Complexity** | No rigid character requirements (Passphrases encouraged) |

**Security:**
- **Storage**: Hash only (Argon2id or bcrypt(as I use for cloudflare workers) recommended).
- **Validation**: The 128-character limit is enforced to prevent Long Password DoS attacks against hashing algorithms.

---

## Validation Status Codes
- **400 Bad Request**: Data does not meet format/