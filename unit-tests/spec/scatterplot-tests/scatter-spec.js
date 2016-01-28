describe("Scatter Plot test", function () {
    var init;
    
    beforeEach(function() {
        init = setup_svg(graph);
        init.render();
    });

    afterEach(function() {
        d3.selectAll('svg').remove();
    });

    //A simple test to check if the svg element was created
    describe("The svg", function() {
        it ('should be created', function() {
            expect(getSvg()).not.toBeNull();
        });
        //check it has the correct height
        it("should have the correct height", function() {
            expect(getSvg().attr('height')).toBe(full_height);
        });
        //check it has the correct width
        it("should have the correct width", function() {
            expect(getSvg().attr('width')).toBe(full_width);
        });
    });
    
    function getSvg() {
        return d3.select('svg');
    }
});

    
