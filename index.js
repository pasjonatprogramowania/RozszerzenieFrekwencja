document.addEventListener("DOMContentLoaded", function () {
    var elems = document.querySelectorAll(".collapsible");
    var instances = M.Collapsible.init(elems);
});
//Materilize css Navbar
document.addEventListener("DOMContentLoaded", function () {
    let elems = document.querySelectorAll(".sidenav");
    let instances = M.Sidenav.init(elems);
});
////Materialize css tooltip
$("document").ready(function () {
    let elems = document.querySelectorAll(".tooltipped");
    let instances = M.Tooltip.init(elems);
});
