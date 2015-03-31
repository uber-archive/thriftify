exception TooSmartException {
    1: string why
}

service demo {
    string hello (1: i32 a, 2: string b) throws (1: TooSmartException tooSmart)
    string good (1:string lol)
}

struct Test {
    1: i32 a
    2: required string b
    3: optional string c
}
