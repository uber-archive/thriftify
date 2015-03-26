exception TooSmartException {
    1: string why
}

service demo {
    string hello (1: i32 a, 2: string b) // throws (1: TooSmartException)
}
