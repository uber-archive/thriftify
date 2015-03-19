struct Simple1 {
    1:i32 int1
}

struct Simple2 {
    1:string str1
}

service Hello {
    string hello(1:string name)
}
