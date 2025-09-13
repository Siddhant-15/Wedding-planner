from enum import Enum


class UUIDString(str):
    pass

class Role(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    ADMIN = "admin"

class Currency(str, Enum):
    INR = "INR"
    USD = "USD"
