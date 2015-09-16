/**
 * Created by Denis on 12/09/2015.
 */
define(['composer', 'lodash', './test-utils.js'], function(Composer, _, testUtils) {
    beforeEach(function() {
        console.info('Creating new composer instance');
        composer = Composer();
    });

    describe('Basic composer tests', function() {
        it('Should not be null', function() {
            expect(composer).not.toBeNull();
        });

        it('Should return parts', function(done) {
            composer.addModules([
                {name: 'test-module-1', location: './test/stub-components/test-module-1'},
                {name: 'test-module-2', location: './test/stub-components/test-module-2'}
            ]);

            var parts = composer.loadParts('test-parts', function(parts) {
                expect(parts.length).toEqual(3);
                done();
            })
        });

        it('Should render 3 parts', function(done) {
            composer.addModules([
                {name: 'test-module-1', location: './test/stub-components/test-module-1'},
                {name: 'test-module-2', location: './test/stub-components/test-module-2'}
            ]);

            var dom = testUtils.renderElement(composer.Container, {name: 'test-parts'});
            composer.loadParts('test-parts', function() {
                expect(dom.nodeName).toEqual('DIV');
                expect(dom.innerHTML).toContain('Hello from test-part-1.1');
                expect(dom.innerHTML).toContain('Hello from test-part-2.1');
                expect(dom.innerHTML).toContain('Hello from test-part-2.2');

                done();
            });
        });

        it('Should return parts for embedded module', function(done) {
            composer.addModule({
                name: 'test-module-2',
                location: './test/stub-components/test-module-2',
                definition: {
                    parts: {
                        'test-parts': ['test-part-2.1', 'test-part-2.2']
                    }
                }
            });

            var parts = composer.loadParts('test-parts', function(parts) {
                expect(parts.length).toEqual(2);
                done();
            })
        })
    });

    describe('Input checks test', function() {
        it('Should not crash on module without definition', function(done) {
            composer.addModule({name: 'test-module-nodef', location: './test/stub-components/test-module-nodef', definition: null});
            composer.loadParts('test-parts', function(parts) {
                expect(parts.length).toEqual(0);
                done();
            })
        });

        it('Should not crash on module with empty definition', function(done) {
            composer.addModule({name: 'test-module-noparts', location: './test/stub-components/test-module-noparts', definition: {}});
            composer.loadParts('test-parts', function(parts) {
                expect(parts.length).toEqual(0);
                done();
            })
        });
    })
});
