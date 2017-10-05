<scxml initial="s11p112 s11p122" version="1.0">
  <state id="s0">
    <transition target="fail"/>
  </state>

  <state id="s1">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>

    <transition event="timeout" target="fail"/>

    <state id="s11" initial="s111">
      <state id="s111"/>

      <parallel id="s11p1">
         <state id="s11p11" initial="s11p111">
           <state id="s11p111"/>
           <state id="s11p112">
             <onentry>
               <raise event="In-s11p112"/>
             </onentry>
           </state>
         </state>

         <state id="s11p12" initial="s11p121">
          <state id="s11p121"/>
          <state id="s11p122">
            <transition event="In-s11p112" target="pass"/>
          </state>
        </state>
      </parallel>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
