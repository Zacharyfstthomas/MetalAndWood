$ErrorActionPreference = 'Stop'
$variations = @("-1212W",
"-1216M",
"-1216W",
"-1818W",
"-1824M",
"-1824W",
"-2424W",
"-912M",
"-912W",
"-COAST",
"-MAG",
"-MBC",
"-MSWD",
"-ORN",
"-POST",
"-SWD",
"-TAG",
"-BMKR",
"-PIN",
"-KEY",
"-28W",
"-416W",
"-624W",
"-832W",
"-33BLK",
"-77BLK",
"-46BLK",
"-57BLK",
"-659BLK",
"-1212BLK",
"-1818BLK",
"-2424BLK",
"-912BLK",
"-1216BLK",
"-1824BLK",
"-630W",
"-630M")


foreach($n in 1..9){
   
   Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO10$n.jpg" 
    trap{
    continue;
    }
    
    foreach($m in 1..38) {
        $v = $variations[$m]
        Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO10$n$v.jpg"
        
    }
}
foreach($n in 10..99){

    Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO1$n.jpg"
   trap{continue;}
    foreach($m in 1..38){
        $v = $variations[$m]
        Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO1$n$v.jpg"
        
}
}

foreach($n in 200..999){

    Copy-Item "C:\Design Images for Web\GRTO\GRTO$n.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO$n.jpg"
    trap{continue;}
    
    foreach($m in 1..38){
        $v = $variations[$m]
        Copy-Item "C:\Design Images for Web\GRTO\GRTO$n.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO$n$v.jpg"
       
}
}