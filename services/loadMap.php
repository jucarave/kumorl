<?php 
    $mapName = $_GET["mapName"];
    
    $path = '../maps/' . $mapName . '.kmf';
    
    if (!empty($mapName) && file_exists($path)){
        $map = file_get_contents($path);
        
        http_response_code(200);
        echo $map;
    }else{
        $ret = new stdClass();
        
        $ret->code = 100;
        $ret->message = 'Error loading the map';
        
        http_response_code(401);
        echo json_encode($ret);
    }