using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantMenu.API.Migrations
{
    /// <inheritdoc />
    public partial class AllowSuperAdminMultipleRestaurants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the unique constraint on UserId so SUPER_ADMIN can own multiple restaurants
            migrationBuilder.DropIndex(
                name: "IX_RestaurantOwners_UserId",
                table: "RestaurantOwners");

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantOwners_UserId",
                table: "RestaurantOwners",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RestaurantOwners_UserId",
                table: "RestaurantOwners");

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantOwners_UserId",
                table: "RestaurantOwners",
                column: "UserId",
                unique: true);
        }
    }
}
