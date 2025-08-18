from enum import Enum

class Role(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    ADMIN = "admin"

class Currency(str, Enum):
    INR = "INR"
    USD = "USD"
