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
"-MDP",
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
try {Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n-DP.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO10$n-DP.jpg"} catch {continue;}
    foreach($m in 1..38)
    {
    $v = $variations[$m]

    Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n-DP.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO10$n-DP$v.jpg"
    
    }
}
foreach($n in 10..99){

try {Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n-DP.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO1$n-DP.jpg"} catch {continue;}

foreach($m in 1..38)
{
 $v = $variations[$m]
    Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n-DP.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO1$n-DP$v.jpg"

}
}

foreach($n in 200..999){

try {Copy-Item "C:\Design Images for Web\GRTO\GRTO$n-DP.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO$n-DP.jpg"} catch {continue;}

foreach($m in 1..38)
{
 $v = $variations[$m]
    Copy-Item "C:\Design Images for Web\GRTO\GRTO$n-DP.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO$n-DP$v.jpg"

}
}
#/***
#foreach($n in 1..9){
#try {Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n-ST.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO10$n-ST.jpg"} catch {continue;}

   # foreach($m in 1..38)
   # {
   # $v = $variations[$m]

 #    Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n-ST.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO10$n-ST$v.jpg"
    
#    }
#}
#foreach($n in 10..99){

#try {Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n-ST.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO1$n-ST.jpg"} catch {continue;}

#foreach($m in 1..38)
#{
 #$v = $variations[$m]
 #   Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n-ST.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO1$n-ST$v.jpg"

#}
#}

#foreach($n in 100..999){

#try {Copy-Item "C:\Design Images for Web\GRTO\GRTO$n-ST.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO$n-ST.jpg"} catch {continue;}

#foreach($m in 1..38)
#{
 #$v = $variations[$m]
 #   Copy-Item "C:\Design Images for Web\GRTO\GRTO$n-ST.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO$n-ST$v.jpg"

#}
#}

#foreach($n in 1..9){
#try {Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n-JL.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO10$n-JL.jpg"} catch {continue;}

   # foreach($m in 1..38)
    #{
   # $v = $variations[$m]

  #  Copy-Item "C:\Design Images for Web\GRTO\GRTO10$n-JL.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO10$n-JL$v.jpg"
    
 #   }
#}
#foreach($n in 10..99){

#try {Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n-JL.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO1$n-JL.jpg"} catch {continue;}

#foreach($m in 1..38)
#{
 #$v = $variations[$m]
 #   Copy-Item "C:\Design Images for Web\GRTO\GRTO1$n-JL.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO1$n-JL$v.jpg"

#}
#}

#foreach($n in 100..999){

#try {Copy-Item "C:\Design Images for Web\GRTO\GRTO$n-JL.jpg" -Destination "C:\Design Images for Web\GRTO\JunkFiles\GRTO$n-JL.jpg"} catch {continue;}
#
#foreach($m in 1..38)
#{
# $v = $variations[$m]
#    Copy-Item "C:\Design Images for Web\GRTO\GRTO$n-JL.jpg" -Destination "C:\Design Images for Web\GRTO\NewFiles\GRTO$n-JL$v.jpg"

#}
#}
#***\