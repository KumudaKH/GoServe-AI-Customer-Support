from pydantic import BaseModel, model_validator

from app.database.product_images import extract_base_name, normalize_image_url


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    original_price: float | None = None
    image_url: str | None = None
    category: str | None = None
    stock: int

    @model_validator(mode="after")
    def fix_image_url(self):
        self.image_url = normalize_image_url(
            self.image_url,
            self.category,
            extract_base_name(self.name),
        )
        return self

    class Config:
        from_attributes = True
