package MW;

import java.util.ArrayList;
import java.util.Arrays;

public class Product{
	
	public String ProductName;
	public static ArrayList<String> ProductAbbreviations; // = new ArrayList<String>(Arrays.asList("-1212W","-1216W","-1818W","-1824M","-1824W","-2424W","-912M","-BMKR","-COAST","-MAG","-MBC","-MSWD","-ORN","-POST","-SWD","-TAG","-PIN12","-PIN72","-KEY","-TILEMMAGSET","-TILEMSWDSET","-28W","-416W","-624W","-832W","-33BLK","-77BLK","-46BLK","-57BLK","-659BLK","-1212BLK","-1818BLK","-2424BLK","-912BLK","-1216BLK","-1824BLK","-630W","630M"));
	public String productAbbrev;
	public static ArrayList<Double> prices;
	public double wholeSalePrice;
	public double retailPrice;
	public double distributorPrice;
	public String productDescription;
	
	public Product(String name) {
		this.ProductName = name;
		this.productAbbrev = ProductAbbreviations.get(Design.ProductNames.indexOf(name));
		calculatePrices(Product.prices.get(Design.ProductNames.indexOf(name)));
	}
	
	private void calculatePrices(Double priceFromList) {
		this.wholeSalePrice = priceFromList;
		this.distributorPrice = priceFromList * 0.77;
		this.retailPrice = priceFromList * 2;
		
	}

	public String getProductName() {
		return ProductName;
	}
	public void setProductName(ArrayList<String> productName) {
		ProductName = productName;
	}
	public ArrayList<String> getProductAbbreviation() {
		return ProductAbbreviation;
	}
	public void setProductAbbreviation(ArrayList<String> productAbbreviation) {
		ProductAbbreviation = productAbbreviation;
	}

	
	
}
