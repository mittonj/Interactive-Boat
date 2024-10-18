This project takes inspiration from my 7 years as a sailing coach. I wanted to create an
interactive scene that contains multiple boats and when moved the sail is rotated to the
correct point of sail. I succeeded in this, in this scene you will see 3 boats that when 
moved using the 'w' and 's' and rotated using the 'a' and 'd' keys that all boats wil move 
and rotate in the direction that they are facing. Boats are set to move at varying speeds.
The sails also rotate in such a way that if the wind was pointing in the same direction that
the camera looks that all boats would capture the most wind possible.

All code was written by myself except for the water and sky code. I used the example water and 
sky files from three.js the three.js package and found and used example implementation here: 
'https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html'

Otherwise, I created the boat design using three.js shapes and shaders. The boat is designed
using hierarchical modeling containing each shape/part of the boat that stores all boat parts in a
boat object class that also stores a threejs group for the entire boat. When the boat group rotates,
everything in that group rotates. In a way the main sail and boom also use FK rotations because,
when the boat group rotates then the mainsail and boom also have to rotate to account for the 'wind'
direction. 


Some resources for textures, fixes, and water/sky code:

Lighting wasn't working for BufferGeometry found a fix here:
    https://stackoverflow.com/questions/52454583/javascript-three-js-three-buffergeometry-not-receiving-any-light-or-shadows

Water and Sky:
    https://threejs.org/examples/?q=water#webgl_shaders_ocean
    https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html#L75

wood1.jpg:
    https://www.istockphoto.com/photo/timber-wood-brown-oak-panels-used-as-background-gm521529428-91384877

wood2.jpg:
    https://www.istockphoto.com/photo/tropical-vintage-bamboo-wall-gm475885512-65628477

wood3.jpg:
    https://www.peakpx.com/en/hd-wallpaper-desktop-khyoj

sail2.jpg:
    https://www.flickr.com/photos/wheatfields/2100746392

    