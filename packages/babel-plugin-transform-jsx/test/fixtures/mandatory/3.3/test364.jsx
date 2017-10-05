<scxml initial="s1" version="1.0">
  <state id="s1" initial="s11p112 s11p122">
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
            <transition event="In-s11p112" target="s2"/>
          </state>
        </state>
      </parallel>
    </state>
  </state>

  <state id="s2">
    <initial>
      <transition target="s21p112 s21p122"/>
    </initial>

    <transition event="timeout" target="fail"/>

    <state id="s21" initial="s211">
      <state id="s211"/>
      <parallel id="s21p1">
        <state id="s21p11" initial="s21p111">
          <state id="s21p111"/>
          <state id="s21p112">
            <onentry>
              <raise event="In-s21p112"/>
            </onentry>
          </state>
        </state>

        <state id="s21p12" initial="s21p121">
          <state id="s21p121"/>
          <state id="s21p122">
            <transition event="In-s21p112" target="s3"/>
          </state>
        </state>
      </parallel>
    </state>
  </state>

  <state id="s3">
   <transition target="fail"/>
    <state id="s31">
      <state id="s311">
        <state id="s3111">
          <transition target="pass"/>
        </state>
        <state id="s3112"/>
        <state id="s312"/>
        <state id="s32"/>
      </state>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
